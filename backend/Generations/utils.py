from ortools.sat.python import cp_model
import collections
import random
from backend.models import TimeTable, TimeTableEntry, WeekDay

def Generate_Timetable(db, assignments, data, user_id):

    #data has a max_solve_seconds to control server load (could be used in the future)

    Model = cp_model.CpModel()

    # keep WeekDay enum members

    index_to_day = {i:d for i,d in enumerate(WeekDay)}  # each item should be a WeekDay (or convertible)
    day_to_index = {d:i for i,d in enumerate(WeekDay)}

    day_indices = set([day_to_index[d] for d in data.days])
    all_slotes = range(1,data.slots+1)
    Hardness_maping = {
        'Low': 1,
        'Med': 2,
        'High': 3,
    }

    slack_report = {}
    all_penalties = []

    def make_slack(error, penalty = 1000): # slack diagnosis function
        
        slack_var = Model.NewIntVar(0, 100, error)
        slack_report[error] = slack_var
        all_penalties.append(slack_var * penalty)
        return slack_var

    shifts = {}
    for assignment in assignments:
        for d in day_indices:
            for s in all_slotes:
                shifts[(assignment.id, d, s)] = Model.NewBoolVar(f'assign_{assignment.id}_d{d}_s{s}')

    # teacher weekly limit
    for assignment in assignments:
        max_classes = getattr(assignment.teacher, 'max_per_week', None)
        if max_classes is not None:
            error_msg = f"max weekly load exceeded {assignment.teacher.t_name} limit is {max_classes}"
            slack = make_slack(error_msg, penalty=1000)
            Model.Add(
                sum(shifts[(assignment.id, d, s)] for s in all_slotes for d in day_indices)
                <= max_classes + slack
            )

    # teacher daily limit
    for assignment in assignments:

        max_class_per_day_teacher = getattr(assignment.teacher, 'max_per_day', None)
        
        if max_class_per_day_teacher is not None:
            for d in day_indices:

                error_msg = f"max Daily load exceeded {assignment.teacher.t_name} limit is {max_class_per_day_teacher}"
                slack = make_slack(error_msg, penalty=500)

                Model.Add(sum(shifts[(assignment.id, d, s)] for s in all_slotes) <= max_class_per_day_teacher + slack)
    
    # teacher consecutive class limit
    for assignment in assignments:

        max_consecutive_class_teacher = getattr(assignment.teacher, 'max_consecutive_class', None)

        if max_consecutive_class_teacher is not None:
            for d in day_indices:
                slots = [shifts[(assignment.id, d, s)] for s in all_slotes]

                for i in range(len(slots) - max_consecutive_class_teacher):

                    error_msg = f"max Consecutive load exceeded {assignment.teacher.t_name} limit is {max_consecutive_class_teacher}"
                    slack = make_slack(error_msg, penalty=500)

                    Model.Add(sum(slots[i : i + max_consecutive_class_teacher + 1]) <= max_consecutive_class_teacher + slack)

    # teacher cannot be in two places same time
    assigned_to_teacher = collections.defaultdict(list)
    for a in assignments:
        assigned_to_teacher[a.teacher_id].append(a)

    for teacher_assignments in assigned_to_teacher.values():
        for d in day_indices:
            for s in all_slotes:

                error_msg = f"Teacher conflicts for {teacher_assignments[0].teacher.t_name} at slot {s}"
                slack = make_slack(error_msg, penalty=100000000)

                Model.Add(sum(shifts[(a.id, d, s)] for a in teacher_assignments) <= 1 + slack)

    # class can have only one teacher at a time (fix: group by class_id)
    assigned_to_class = collections.defaultdict(list)
    for a in assignments:
        assigned_to_class[a.class_id].append(a)

    for class_assignments in assigned_to_class.values():
        for d in day_indices:
            for s in all_slotes:

                error_msg = f"Class conflicts for {class_assignments[0].class_.c_name} at slot {s}"
                slack = make_slack(error_msg, penalty=100000000)

                Model.Add(sum(shifts[(a.id, d, s)] for a in class_assignments) <= 1 + slack)


    #A class teacher should take morning classes at the specified dates
    for assignment in assignments:

        morning_class_days = getattr(assignment, 'morning_class_days', None)

        if morning_class_days is not None:
            
            for d in morning_class_days:

                if day_to_index[d] in day_indices:

                    error_msg = f"No Morning Class {assignment.teacher.t_name} for {assignment.class_.c_name} on {d.value}"
                    slack = make_slack(error_msg, penalty=500)

                    Model.Add(shifts[(assignment.id, day_to_index[d], 1)] + slack >= 1)



    #An assingned teacher should take the class for atleast min_per_day times
    #An assigned teacher should take the class atmost max_per_day times

    for assignment in assignments:

        min_classes_per_day = getattr(assignment.subject, 'min_per_day', None)
        max_classes_per_day = getattr(assignment.subject, 'max_per_day', None)

        if min_classes_per_day is not None or max_classes_per_day is not None:

            for d in day_indices:
                daily_sum = sum(shifts[(assignment.id, d, s)] for s in all_slotes)

                if min_classes_per_day is not None:

                    error_msg = f"Min Daily Classes {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} (requires: {min_classes_per_day})"
                    slack = make_slack(error_msg, penalty=10000)

                    Model.Add(daily_sum + slack >= min_classes_per_day)

                if max_classes_per_day is not None:

                    error_msg = f"Max Daily Classes {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} (limit: {max_classes_per_day})"
                    slack = make_slack(error_msg, penalty=10000)

                    Model.Add(daily_sum <= max_classes_per_day + slack)


    #An assigned teacher should take the class atleast min_per_week times
    #An assigned teacher should take the class atmost max_per_week times

    for assignment in assignments:

        min_classes_per_week = getattr(assignment.subject, 'min_per_week', None)
        max_classes_per_week = getattr(assignment.subject, 'max_per_week', None)

        weekly_sum = sum(shifts[(assignment.id, d, s)] for d in day_indices for s in all_slotes)

        if min_classes_per_week is not None:
            error_msg = f"Min Weekly Classes {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} (requires: {min_classes_per_week})"
            slack = make_slack(error_msg, penalty=100000)

            Model.Add(weekly_sum + slack >= min_classes_per_week)

        if max_classes_per_week is not None:
            error_msg = f"Max Weekly Classes {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} (limit: {max_classes_per_week})"
            slack = make_slack(error_msg, penalty=100000)

            Model.Add(weekly_sum <= max_classes_per_week + slack)

    #A teacher should not take more consecutive classes than max_consecutive_class
    for assignment in assignments:

        max_consecutive_class = getattr(assignment.subject, 'max_consecutive_class', None)

        if max_consecutive_class is not None:
            
            for d in day_indices:

                slots = [shifts[(assignment.id, d, s)] for s in all_slotes]

                for i in range(len(slots) - max_consecutive_class):

                    error_msg = f"Max consecutive Classes exceeded {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} on {index_to_day[d].value} (start slot: {i+1}) (limit: {max_consecutive_class})"
                    slack = make_slack(error_msg, penalty=50)

                    Model.Add(sum(slots[i : i + max_consecutive_class + 1]) <= max_consecutive_class + slack)

    #A teacher should take atleast min_consecutive_classes
    for assignment in assignments:
        
        min_consecutive_class = getattr(assignment.subject, 'min_consecutive_class', None)

        if min_consecutive_class is not None:

            if min_consecutive_class == 2:

                for d in day_indices:

                    slotes = [shifts[(assignment.id, d, s)] for s in all_slotes]

                    for i in range(len(all_slotes)):

                        cur = slotes[i]


                        neighbors = []
                        if i > 0:
                            neighbors.append(slotes[i-1])
                        if i < len(all_slotes)-1:
                            neighbors.append(slotes[i+1])
                        
                        if neighbors:

                            error_msg = f"Single class (Min: 2) {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} on {index_to_day[d].value} slot {i+1}"
                            slack = make_slack(error_msg, penalty=5000)

                            Model.Add(sum(neighbors) + slack >= 1).OnlyEnforceIf(cur)
                        else:

                            error_msg = f"Impossible Consecutive class {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} on {index_to_day[d].value} slot {i+1}"
                            slack = make_slack(error_msg, penalty=5000)
                            Model.Add(slack >= 1).OnlyEnforceIf(cur)
            else:
                for d in day_indices:
                    slots = [shifts[(assignment.id, d, s)] for s in all_slotes]

                    for s in range(len(all_slotes)):
                        current = slots[s]
                        # 1. Detect "Start of Block" (Current is ON, Prev is OFF)
                        is_start = Model.NewBoolVar(f'start_{assignment.id}_{d}_{s}')
                        
                        if s > 0:
                            prev = slots[s-1]
                            # Start = Current AND (NOT Prev)
                            Model.AddBoolAnd([current, prev.Not()]).OnlyEnforceIf(is_start)
                            # Ensure is_start is False if condition isn't met (optional but safer)
                            Model.AddBoolOr([current.Not(), prev]).OnlyEnforceIf(is_start.Not()) 
                        else:
                            # If first slot of the day, Start = Current
                            Model.Add(is_start == current)

                        # Enforce: If this is a start, the next (Min-1) slots must be ON
                        needed = min_consecutive_class - 1
                        
                        if s + needed < len(slots):
                            for i in range(1, min_consecutive_class):
                                # Force subsequent slots to 1
                                error_msg = f"Broken Block (Min {min_consecutive_class}) {assignment.subject.subject_name} in {assignment.class_.c_name} with {assignment.teacher.t_name} on {index_to_day[d].value} at slot {s+i+1}"
                                slack = make_slack(error_msg, penalty=5000)

                                Model.Add(slots[s+i] + slack >= 1).OnlyEnforceIf(is_start)
                        else:
                            # Not enough room left in the day to start a block here
                            error_msg = f"Block Cut Off (End of Day or not enough slots to complete sequence) {assignment.subject.subject_name} on {index_to_day[d].value} at starting slot {s+1}"
                            slack = make_slack(error_msg, penalty=5000)

                            Model.Add(slack >= 1).OnlyEnforceIf(is_start)

    
    #no two hard subjects should be together
    for class_assign in assigned_to_class.values(): #reusing the variable from class conflicts :)

        hard_subs = [a for a in class_assign if a.subject.is_hard_sub == "High"]

        if not hard_subs:
            continue

        for d in day_indices:
            for s in all_slotes:

                current_hard_shifts = [shifts[(a.id, d, s)] for a in hard_subs]

                next_hard_shifts = [shifts[(a.id, d, s+1)] for a in hard_subs]

                if current_hard_shifts and next_hard_shifts:

                    error_msg = f"Student Mental fatigue(adj hard subjects): Class {class_assign[0].class_.c_name} on {index_to_day[d]} (slotes {s} and {s+1})"
                    slack = make_slack(error_msg, penalty=500)

                    Model.Add(sum(current_hard_shifts) + sum(next_hard_shifts) <= 1 + slack)


    #Priortising hard subject in the morning
    slot_cost = {
        s: (s-1) * 2 for s in all_slotes
    }

    total_penalty_terms = []

    for assignment in assignments:
        for d in day_indices:

            for s in all_slotes:

                cur = shifts[(assignment.id, d, s)]
                cost = slot_cost[s]
                all_penalties.append(cur * cost * Hardness_maping[assignment.subject.is_hard_sub]) #if the current slot is 0 then we append 0 else we append cost plan is to minimise cost
                #we are appending it to all penaltiess to minimize in one go


    for assignment in assignments:
        for d in day_indices:
            for s in all_slotes:
                all_penalties.append(shifts[(assignment.id, d, s)] * -1000)


    Model.Minimize(sum(all_penalties))


    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = getattr(data, 'max_solve_seconds', 30)
    status = solver.Solve(Model)

    # if model has no objective, solver may return all-false solution; prefer more assignments
    try:
        # set objective to maximize total assignments if not already set
        if not Model.HasObjective():
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = getattr(data, 'max_solve_seconds', 30)
            solver.parameters.num_search_workers = 8
            solver.parameters.random_polarity_ratio = 0.99  # 99% chance to choose 0 or 1 randomly
            solver.parameters.random_seed = random.randint(0, 10000)
            solver.parameters.exploit_best_solution_probability = 0.2
            status = solver.Solve(Model)
    except Exception:
        # if objective addition fails, continue with original status
        pass

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        detected_errors = []

        for error, slack_var in slack_report.items():
            severity = solver.Value(slack_var)
            if severity > 0:
                detected_errors.append(f"{error} (Violation amount: {severity})")
        if len(detected_errors) > 0:
            # change it to request to llm to get englified (wtf is this word) errors
            return {
                'status': 'failed',
                'error': detected_errors
            }
        else:
            try:
                new_timetable = TimeTable(timetable_name=data.timetable_name, user_id=user_id, slots=data.slots)
                db.add(new_timetable)
                db.flush()
                db.refresh(new_timetable)
                
                
                for d in day_indices:
                    for s in all_slotes:
                        for assignment in assignments:
                            if solver.Value(shifts[(assignment.id, d, s)]):
                                # store WeekDay enum member (not string) to match db enum type
                                entry = TimeTableEntry(
                                    timetable_id=new_timetable.id,
                                    class_name=assignment.class_.c_name,
                                    room_name=assignment.class_.r_name,
                                    teacher_name=assignment.teacher.t_name,
                                    subject_name=assignment.subject.subject_name,
                                    day=index_to_day[d],
                                    slot=s
                                )
                                db.add(entry)
                                
                # commit all changes at once
                db.commit()
                return {
                    'status': 'success',
                    'timetable_id': new_timetable.id,
                }
            except Exception as e:
                db.rollback()
                return {
                    'status': 'DATABASE_ERROR',
                    'error': [f'{str(e)}']
                }
    else:
        return {
            'status': 'MODEL_DOWN',
            'error': ["Contact admin"] #verthe oru rasam
        }
