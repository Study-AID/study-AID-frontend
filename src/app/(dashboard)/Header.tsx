import React from 'react';

interface HeaderProps {
  date: string;
  semesterLabel: string;
}

const Header: React.FC = () => {
  return (
    <div className="mb-4 border-b border-[#C4C4C4] bg-[#EFEFEF] px-6 py-4">
      <div className="mb-2 text-2xl">{`date`}</div>
      <div className="text-lg text-gray-600">{`semesterLabel`}</div>
    </div>
  );
};

export default Header;
