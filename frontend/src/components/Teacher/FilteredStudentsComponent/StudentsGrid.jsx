import React from 'react';
import StudentCard from '../Common/StudentCard';

const StudentsGrid = ({ students, onStudentClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {students.map((student) => (
        <StudentCard
          key={student.studentId}
          student={student}
          onClick={onStudentClick}
        />
      ))}
    </div>
  );
};

export default StudentsGrid;
