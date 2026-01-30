from ortools.sat.python import cp_model
import collections
from backend.models import TimeTable, TimeTableEntry, WeekDay

def Generate_Timetable(db, assignments, data, user_id):
    Model = cp_model.CpModel()
    # keep WeekDay enum members
    index_to_day = {i:d for i,d in enumerate(WeekDay)}  # each item should be a WeekDay (or convertible)
    day_to_index = {d:i for i,d in enumerate(WeekDay)}
    # ensure enum members if strings were passed

    day_indices = set([day_to_index[d] for d in data.days])
    all_slotes = range(1,data.slots+1)
    Hardness_maping = {
        'Low': 1,
        'Med': 2,
        'High': 3,
    }

    shifts = {}
    for assignment in assignments:
        for d in day_indices:
            for s in all_slotes:
                shifts[(assignment.id, d, s)] = Model.NewBoolVar(f'assign_{assignment.id}_d{d}_s{s}')

    # teacher weekly limit (use <= for flexibility)
    for assignment in assignments:
        max_classes = getattr(assignment.teacher, 'max_classes', None)
        if max_classes is not None:
            Model.Add(
                sum(shifts[(assignment.id, d, s)] for d in day_indices for s in all_slotes)
                <= max_classes
            )

    # teacher cannot be in two places same time
    assigned_to_teacher = collections.defaultdict(list)
    for a in assignments:
        assigned_to_teacher[a.teacher_id].append(a)

    for teacher_assignments in assigned_to_teacher.values():
        for d in day_indices:
            for s in all_slotes:
                Model.Add(sum(shifts[(a.id, d, s)] for a in teacher_assignments) <= 1)

    # class can have only one teacher at a time (fix: group by class_id)
    assigned_to_class = collections.defaultdict(list)
    for a in assignments:
        assigned_to_class[a.class_id].append(a)

    for class_assignments in assigned_to_class.values():
        for d in day_indices:
            for s in all_slotes:
                Model.Add(sum(shifts[(a.id, d, s)] for a in class_assignments) <= 1)


    #A class teacher should take morning classes at the specified dates
    for assignment in assignments:

        morning_class_days = getattr(assignment, 'morning_class_days', None)

        if morning_class_days is not None:
            
            for d in morning_class_days:

                if day_to_index[d] not in day_indices:
                    return False

                Model.Add(shifts[(assignment.id, day_to_index[d], 1)] == 1)



    #An assingned teacher should take the class for atleast min_per_day times
    #An assigned teacher should take the class atmost max_per_day times

    for assignment in assignments:

        min_classes_per_day = getattr(assignment.subject, 'min_per_day', None)
        max_classes_per_day = getattr(assignment.subject, 'max_per_day', None)

        if min_classes_per_day is not None or max_classes_per_day is not None:

            for d in day_indices:

                if min_classes_per_day is not None:

                    Model.Add(sum(shifts[(assignment.id, d, s)] for s in all_slotes) >= min_classes_per_day)

                if max_classes_per_day is not None:

                    Model.Add(sum(shifts[(assignment.id, d, s)] for s in all_slotes) <= max_classes_per_day)


    #An assigned teacher should take the class atleast min_per_week times
    #An assigned teacher should take the class atmost max_per_week times

    for assignment in assignments:

        min_classes_per_week = getattr(assignment.subject, 'min_per_week', None)
        max_classes_per_week = getattr(assignment.subject, 'max_per_week', None)

        if min_classes_per_week is not None:

            Model.Add(sum(shifts[(assignment.id, d, s)] for d in day_indices for s in all_slotes) >= min_classes_per_week)

        if max_classes_per_week is not None:

            Model.Add(sum(shifts[(assignment.id, d, s)] for d in day_indices for s in all_slotes) <= max_classes_per_week)

    #A teacher should not take more consecutive classes than max_consecutive_class
    for assignment in assignments:

        max_consecutive_class = getattr(assignment.subject, 'max_consecutive_class', None)

        if max_consecutive_class is not None:
            
            for d in day_indices:

                slots = [shifts[(assignment.id, d, s)] for s in all_slotes]

                for i in range(len(slots) - max_consecutive_class):

                    Model.Add(sum(slots[i : i + max_consecutive_class + 1]) <= max_consecutive_class)

    #A teacher should take atleast min_consecutive_classes
    for assignment in assignments:
        
        min_consecutive_class = getattr(assignment.subject, 'min_consecutive_class', None)

        if min_consecutive_class is not None:

            if min_consecutive_class == 2:

                for d in day_indices:

                    slotes = [shifts[(assignment.id, d, s)] for s in all_slotes]

                    for i in range(len(all_slotes)):

                        cur = slotes[i]
                        prev = slotes[i-1] if i > 0 else None
                        next = slotes[i+1] if i < len(all_slotes)-1 else None

                        neighbors = []
                        if i != 0:
                            neighbors.append(prev)
                        if i < len(all_slotes)-1:
                            neighbors.append(next)
                        
                        if neighbors:
                            Model.AddBoolOr(neighbors).OnlyEnforceIf(cur)
                        else:
                            Model.Add(cur == 0)
            else:
                for d in day_indices:
                    slots = [shifts[(assignment.id, d, s)] for s in all_slotes]

                    for s in range(len(all_slotes)):
                        current = slots[s]
                        # 1. Detect "Start of Block" (Current is ON, Prev is OFF)
                        is_start = Model.NewBoolVar(f'start_{assignment.id}_{d}_{s}')
                        
                        if s != 0:
                            prev = slots[s-1]
                            # Start = Current AND (NOT Prev)
                            Model.AddBoolAnd([current, prev.Not()]).OnlyEnforceIf(is_start)
                            # Ensure is_start is False if condition isn't met (optional but safer)
                            Model.AddBoolOr([current.Not(), prev]).OnlyEnforceIf(is_start.Not()) 
                        else:
                            # If first slot of the day, Start = Current
                            Model.Add(is_start == current)

                        # 2. Enforce: If this is a start, the next (Min-1) slots must be ON
                        needed = min_consecutive_class - 1
                        
                        if s + needed < len(slots):
                            for i in range(1, min_consecutive_class):
                                # Force subsequent slots to 1
                                Model.Add(slots[s+i] == 1).OnlyEnforceIf(is_start)
                        else:
                            # Not enough room left in the day to start a block here
                            Model.Add(is_start == 0)

    
    #Priortising hard subject in the morning
    slot_cost = {
        s: (s-1) * 10 * 2 for s in all_slotes
    }

    total_penalty_terms = []

    for assignment in assignments:
        for d in day_indices:

            for s in all_slotes:

                cur = shifts[(assignment.id, d, s)]
                cost = slot_cost[s]
                total_penalty_terms.append(cur * cost * Hardness_maping[assignment.subject.is_hard_sub]) #if the current slot is 0 then we append 0 else we append cost plan is to minimise cost

    Model.Minimize(sum(total_penalty_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = getattr(data, 'max_solve_seconds', 30)
    status = solver.Solve(Model)

    # if model has no objective, solver may return all-false solution; prefer more assignments
    try:
        # set objective to maximize total assignments if not already set
        if not Model.HasObjective():
            Model.Maximize(sum(shifts.values()))
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = getattr(data, 'max_solve_seconds', 30)
            status = solver.Solve(Model)
    except Exception:
        # if objective addition fails, continue with original status
        pass

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        try:
            new_timetable = TimeTable(timetable_name=data.timetable_name, user_id=user_id, slots=data.slots)
            db.add(new_timetable)
            db.flush()
            db.refresh(new_timetable)
            
            
            for d in day_indices:
                for s in all_slotes:
                    for assignment in assignments:
                        if solver.Value(shifts[(assignment.id, d, s)]):
                            # store WeekDay enum member (not string) to match DB enum type
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
            return new_timetable.id
        except Exception:
            db.rollback()
            return False
    else:
        return False
