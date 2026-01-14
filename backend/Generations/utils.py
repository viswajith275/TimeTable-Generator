from ortools.sat.python import cp_model
import collections
from backend.models import TimeTable, TimeTableEntry, WeekDay

def Generate_Timetable(db, assignments, data, user_id):
    Model = cp_model.CpModel()
    # keep WeekDay enum members
    all_days = list(data.days)  # each item should be a WeekDay (or convertible)
    # ensure enum members if strings were passed
    for i, d in enumerate(all_days):
        if not isinstance(d, WeekDay):
            try:
                all_days[i] = WeekDay(d)
            except Exception:
                all_days[i] = WeekDay[d.upper()]

    day_indices = range(len(all_days))
    all_slotes = range(1,data.slotes+1)

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

    #An assingned teacher should take the class for atleast min_per_day times
    #An assigned teacher should take the class atmost max_per_day times
    for assignment in assignments:
        min_classes_per_day = getattr(assignment, 'min_per_day', None)
        max_classes_per_day = getattr(assignment, 'max_per_day', None)
        if min_classes_per_day is not None or max_classes_per_day is not None:
            for d in day_indices:
                if min_classes_per_day is not None:
                    Model.Add(sum(shifts[(assignment.id, d, s)] for s in all_slotes) >= min_classes_per_day)
                if max_classes_per_day is not None:
                    Model.Add(sum(shifts[(assignment.id, d, s)] for s in all_slotes) <= max_classes_per_day)

    #An assigned teacher should take the class atleast min_per_week times
    #An assigned teacher should take the class atmost max_per_week times
    for assignment in assignments:
        min_classes_per_week = getattr(assignment, 'min_per_week', None)
        max_classes_per_week = getattr(assignment, 'max_per_week', None)
        if min_classes_per_week is not None:
            Model.Add(sum(shifts[(assignment.id, d, s)] for d in day_indices for s in all_slotes) >= min_classes_per_week)
        if max_classes_per_week is not None:
            Model.Add(sum(shifts[(assignment.id, d, s)] for d in day_indices for s in all_slotes) <= max_classes_per_week)

    #A teacher should not take more consecutive classes than max_consecutive_class
    for assignment in assignments:
        max_consecutive_class = getattr(assignment, 'max_consecutive_class', None)
        if max_consecutive_class is not None:
            
            for d in day_indices:
                days = []

                for s in all_slotes:
                    slot_vars = [shifts[(a.id, d, s)] for a in assignments]
            
                is_working_s = Model.NewBoolVar(f'working_t{assignment.teacher_id}_d{d}_s{s}')
                Model.Add(sum(slot_vars) == 1).OnlyEnforceIf(is_working_s)
                Model.Add(sum(slot_vars) == 0).OnlyEnforceIf(is_working_s.Not())
            
                days.append(is_working_s)
            for i in range(len(all_slotes) - max_consecutive_class):
                window = days[i : i + max_consecutive_class + 1]

                Model.Add(sum(window) <= max_consecutive_class)

    
    #Priortising hard subject in the morning
    slot_cost = {
        {s:(s-1)*10} for s in all_slotes
    }

    total_penalty_terms = []

    for assignment in assignments:
        if assignment.is_hard_sub:

            for d in day_indices:

                for s in all_slotes:

                    cur = shifts[(assignment.id, d, s)]
                    cost = slot_cost[s]

                    total_penalty_terms.append(cur * cost) #if the current slot is 0 then we append 0 else we append cost plan is to minimise cost

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
            new_timetable = TimeTable(timetable_name=data.timetable_name, user_id=user_id)
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
                                assignment_id=assignment.id,
                                day=all_days[d],
                                slot=s
                            )
                            db.add(entry)
                            
            # commit all changes at once
            db.commit()
            return True
        except Exception:
            db.rollback()
            return False
    else:
        return False
