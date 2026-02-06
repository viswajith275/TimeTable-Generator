from fastapi import APIRouter, HTTPException, status, Request
from typing import List
from backend.oauth import UserDep
from backend.database import SessionDep
from backend.rate_limiter_deps import limiter
from backend.models import Subject, SubjectBase, SubjectCreate, SubjectUpdate, Class


subject_routes = APIRouter(tags=['Subjects'])

@subject_routes.get('/subjects', response_model=List[SubjectBase])
def Fetch_all_subjects(current_user: UserDep, request: Request):
    subjects = current_user.subjects

    if subjects:
        result = []
        for s in subjects:
            result.append({
                'id': s.id,
                'subject':s.subject_name,
                'created_at': s.created_at,
                'min_per_day': s.min_per_day,
                'max_per_day': s.max_per_day,
                'min_per_week': s.min_per_week,
                'max_per_week': s.max_per_week,
                'min_consecutive_class': s.min_consecutive_class,
                'max_consecutive_class': s.max_consecutive_class,
                'is_lab_subject': s.is_lab_subject,
                'lab_classes': [c.c_name for c in s.lab_classes],
                'is_hard_sub': s.is_hard_sub
            })
            
        return result
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No subjects Found!')

@subject_routes.get('/subjects/{id}', response_model=SubjectBase)
def Fetch_subject(current_user: UserDep, db: SessionDep, id: int, request: Request):

    subject = db.query(Subject).filter(Subject.user_id == current_user.id, Subject.id == id).first()

    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No subjects Found!')

    return {
            'id': subject.id,
            'created_at': subject.created_at,
            'subject':subject.subject_name,
            'min_per_day': subject.min_per_day,
            'max_per_day': subject.max_per_day,
            'min_per_week': subject.min_per_week,
            'max_per_week': subject.max_per_week,
            'min_consecutive_class': subject.min_consecutive_class,
            'max_consecutive_class': subject.max_consecutive_class,
            'is_lab_subject': subject.is_lab_subject,
            'lab_classes': [c.c_name for c in subject.lab_classes],
            'is_hard_sub': subject.is_hard_sub
            }
    

@subject_routes.post('/subjects', response_model=SubjectBase)
def Create_subject(current_user: UserDep, db: SessionDep, values: SubjectCreate, request: Request):

    exists = db.query(Subject).filter(Subject.user_id == current_user.id, Subject.subject_name == values.subject).first()

    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Subject already exists!')
    
    if values.is_lab_subject:
        try:
            subject = Subject(
                subject_name=values.subject,
                user_id=current_user.id,
                min_per_day=values.min_per_day,
                max_per_day=values.max_per_day,
                min_per_week=values.min_per_week,
                max_per_week=values.max_per_week,
                max_consecutive_class=values.max_consecutive_class,
                min_consecutive_class=values.min_consecutive_class,
                is_lab_subject=values.is_lab_subject,
                is_hard_sub=values.is_hard_sub.value
            )

            db.add(subject)
            db.flush()
            db.refresh(subject)


            for i in values.lab_classes:

                lab_class = db.query(Class).filter(Class.id == i, Class.user_id == current_user.id, Class.isLab == True).first()

                if not lab_class:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Lab class does not exist!')

                subject.lab_classes.append(lab_class)

            db.commit()
        except Exception as e:

            db.rollback()

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{str(e)}")
            

                
    else:

        subject = Subject(
            subject_name=values.subject,
            user_id=current_user.id,
            min_per_day=values.min_per_day,
            max_per_day=values.max_per_day,
            min_per_week=values.min_per_week,
            max_per_week=values.max_per_week,
            max_consecutive_class=values.max_consecutive_class,
            min_consecutive_class=values.min_consecutive_class,
            is_hard_sub=values.is_hard_sub.value
        )

        db.add(subject)
        db.commit()
        db.refresh(subject)

    return {
                'id': subject.id,
                'created_at': subject.created_at,
                'subject':subject.subject_name,
                'min_per_day': subject.min_per_day,
                'max_per_day': subject.max_per_day,
                'min_per_week': subject.min_per_week,
                'max_per_week': subject.max_per_week,
                'min_consecutive_class': subject.min_consecutive_class,
                'max_consecutive_class': subject.max_consecutive_class,
                'is_lab_subject': subject.is_lab_subject,
                'lab_classes': [c.c_name for c in subject.lab_classes],
                'is_hard_sub': subject.is_hard_sub
            }

@subject_routes.put('/subjects/{id}', response_model=SubjectBase)
def Update_subject(current_user: UserDep, db: SessionDep, values: SubjectUpdate, id: int, request: Request):
    subject = db.query(Subject).filter(Subject.user_id == current_user.id, Subject.id == id).first()
    
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No subjects Found!')

    if values.is_lab_subject:
        try:
            subject.is_lab_subject = values.is_lab_subject

            for i in values.lab_classes:

                lab_class = db.query(Class).filter(Class.id == i, Class.user_id == current_user.id, Class.isLab).first()

                if not lab_class:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Lab class does not exist!')
                if lab_class not in subject.lab_classes:
                    subject.lab_classes.append(lab_class)
            
        except Exception as e:
            
            db.rollback()

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{str(e)}")
            

    subject.subject_name = values.subject
    subject.min_per_day = values.min_per_day
    subject.max_per_day = values.max_per_day
    subject.min_per_week = values.min_per_week
    subject.max_per_week = values.max_per_week
    subject.max_consecutive_class = values.max_consecutive_class
    subject.min_consecutive_class = values.min_consecutive_class
    subject.is_hard_sub = values.is_hard_sub.value

    db.commit()

    return {
                'id': subject.id,
                'created_at': subject.created_at,
                'subject':subject.subject_name,
                'min_per_day': subject.min_per_day,
                'max_per_day': subject.max_per_day,
                'min_per_week': subject.min_per_week,
                'max_per_week': subject.max_per_week,
                'min_consecutive_class': subject.min_consecutive_class,
                'max_consecutive_class': subject.max_consecutive_class,
                'is_lab_subject': subject.is_lab_subject,
                'lab_classes': [c.c_name for c in subject.lab_classes],
                'is_hard_sub': subject.is_hard_sub
            }
        

@subject_routes.delete('/subjects/{id}')
def Delete_subjects(current_user: UserDep, db: SessionDep, id: int, request: Request):

    subject = db.query(Subject).filter(Subject.user_id == current_user.id, Subject.id == id).first()

    if not subject:
        
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='No subjects Found!')
    
    db.delete(subject)
    db.commit()

    return {'message': 'subject deleted successfully!'}
