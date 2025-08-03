import React from 'react';
import { useNavigate } from 'react-router-dom';
import SelectSubject from './SelectSubject';

const GenerateNote = () => {
  const navigate = useNavigate();

  return (
    <SelectSubject mode="notes" />
  );
};

export default GenerateNote;