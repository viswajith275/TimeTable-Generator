from ortools.sat.python import cp_model
import collections
from backend.models import TimeTable, TimeTableEntry


def Generate_Timetable(db, assignments, data, user_id):

    #Condition 4: There should not be more than 1 class of the same teacher on the same room
    #Condition 5: There should not be a free period in the morning
    #Condition 6: 12pm is strictly for Lunch
    Model = cp_model.CpModel()
    all_days = data.days
    all_slotes = range(data.slotes)

    shifts = {}

    #Condition 1: All Periods must be filled
    for d in all_days:
        for s in all_slotes:
            Model.Add(
                sum(shifts[(a.id, d, s)] for a in assignments) == 1
          )

    for assignment in assignments:
        for d in all_days:
            for s in all_slotes:
                shifts[(assignment.id, d, s)] = Model.NewBoolVar(f'assign_{assignment.id}_d{d}_s{s}')

    #Condition 2: A teacher can take n classes per week, the total of all should be (no of rooms * no of days * no of time slots)
    for assignment in assignments:
        Model.Add(
        sum(shifts[(assignment.id, d, s)] for d in all_days for s in all_slotes) 
        == assignment.teacher.max_classes
    )
        
    #Condition 3: On a Specific day,a teacher can only be assigned to one class at given time
    assigned_to_teacher = collections.defaultdict(list)

    for assignment in assignments:
        assigned_to_teacher[assignment.teacher_id].append(assignment)

    for teacher_assignments in assigned_to_teacher.values():
        for d in all_days:
            for s in all_slotes:
                Model.Add(
                    sum(shifts[(a.id, d, s)] for a in teacher_assignments) <= 1
                )


    #Condition 4: On a Specific day,a class can only assign one teacher at a time
    assigned_to_class = collections.defaultdict(list)

    for assignment in assignments:
        assigned_to_class[assignment.teacher_id].append(assignment)

    for class_assignments in assigned_to_class.values():
        for d in all_days:
            for s in all_slotes:
                Model.add(
                    sum(shifts[(a.id, d, s)] for a in class_assignments) <= 1
                )


    solver = cp_model.CpSolver()
    status = solver.Solve(Model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:

        new_timetable = TimeTable(timetable_name=data.timetable_name, user_id=user_id)

        db.add(new_timetable)
        db.commit()
        db.refresh(new_timetable)

        for d in all_days:
            for s in all_slotes:
                for assignment in assignments:
                    # If the solver says "True", create the entry
                    if solver.Value(shifts[(assignment.id, d, s)]):
                        
                        
                        new_entry = TimeTableEntry(
                            timetable_id = new_timetable.id, # The container ID
                            assignment_id=assignment.id,
                            day=d,
                            slotes=s
                        )
                        db.add(new_entry)
                
        db.commit()
        return True
    else:
        return False
