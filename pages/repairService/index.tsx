// pages/repairService/index.tsx
import React from 'react';
import TechnicianList from '../../libs/components/repairService/TechnicianList';
import RepairedPropertyList from '../../libs/components/repairService/RepairedPropertyList';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';


const RepairServicePage = () => {
  return (
    <div className="repair-service-page">
      {/* Ustalar */}
      <section className="technician-section">
        <h2 className="section-title">Technicians</h2>
        <TechnicianList />
      </section>

      {/* Ta’mirlangan Mulklar */}
      <section className="property-section">
        <h2 className="section-title">Repaired Properties</h2>
        <RepairedPropertyList />
      </section>
    </div>
  );
};

export default withLayoutBasic(RepairServicePage);
