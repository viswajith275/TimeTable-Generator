/*
    TODO:

    1. Fetch Data of Teacher
    2. Process and Update json
*/

const TeacherData = [
    {
        label : 'Subject',
        children : [
            { label: 'All'},
            { label: 'Physics' },
            { label: 'Chemistry' },
            { label: 'Maths' },
            { label: 'Computer Science' }
        ]
    },
    {
        label: 'Working Hours',
        children: [
            { label: 'All' },
            { label: '< 3hr' },
            { label: '< 5hr' },
            { label: '> 5hr' },
        ]
    }
];

export default TeacherData;