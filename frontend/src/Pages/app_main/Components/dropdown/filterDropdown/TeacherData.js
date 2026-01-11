/*
    TODO:

    1. Fetch Data of Teacher
    2. Process and Update json
*/

const TeacherData = [
    {
        label : 'Subject',
        children : [
            { label: 'Physics' },
            { label: 'Chemistry' },
            { label: 'Maths' },
            { label: 'Computer Science' }
        ]
    },
    {
        label: 'Working Hours',
        children: [
            { label: '< 3hr / week' },
            { label: '< 5hr / week' },
            { label: '> 5hr / week' },
        ]
    }
];

export default TeacherData;