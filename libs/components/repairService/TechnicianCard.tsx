import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TechnicianCardProps {
  technician: Member;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({ technician }) => {
  const device = useDeviceDetect();
  const router = useRouter();

  const technicianImage = technician?.memberImage
    ? `${process.env.REACT_APP_API_URL}/${technician.memberImage}`
    : '/img/profile/defaultUser.svg';

  return (
    <Stack className="technician-card">
      <img src={technicianImage} alt={technician.memberNick || 'Technician'} />

      <strong>{technician.memberNick}</strong>
      <span>{technician.memberType}</span>
    </Stack>
  );
};

export default TechnicianCard;
