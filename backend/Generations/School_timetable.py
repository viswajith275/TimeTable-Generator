from ortools.sat.python import cp_model

model = cp_model.CpModel()

#Maybe can add Saturday too
days=['Mon','Tue','Wed','Thu','Fri']

#Can be inputted in later
rooms=['Room101','Room102','Room103']
times=['9am','10am','11am']
teachers=['Bob','Charlie','Alice','FREE']

#Feel free to change the structure, but please explain, if you do
shifts={}
#The Order is **Teacher,day,room,time**

for t in teachers:
    for d in days:
        for r in rooms:
            for time in times:
                shifts[(t,d,r,time)]= model.new_bool_var(f"{t}_{d}_{r}_{time}")

#Constraint 1: On a Specific day,a teacher can only occupy one class at a time
for t in teachers:
    for d in days:
        for time in times:
            model.Add(sum(shifts[t,d,r,time] for r in rooms) <= 1)

#Constraint 2: All Periods must be filled
for d in days:
    for r in rooms:
        for time in times:
            model.Add(sum(shifts[t,d,r,time] for t in teachers)==1)


#Constraint 3: A teacher can take n classes per week
teacher_limits = {
    'Bob': 10,    
    'Charlie': 12,
    'Alice': 13,
    'FREE': 10
}

for t in teachers:
    my_shifts = [shifts[t,d,r,time] for d in days for r in rooms for time in times]

    model.Add(sum(my_shifts)==teacher_limits[t])

#-------Solver----------
solver = cp_model.CpSolver()
status = solver.Solve(model)

if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
    for d in days:
        print(f"{d}:")
        for time in times:
            print(f"\n{time}:")
            for r in rooms:
                for t in teachers:
                    if solver.Value(shifts[(t, d, r, time)]) == 1:
                        print(f"  {r}: {t}")
        print("\n")
else:
    print("No Solution Found!!!")