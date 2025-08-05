// src/components/Sidebar/index.tsx
import React from 'react';
import PlaceAnalysis from './PlaceAnalysis';
import CustomerAnalysis from './CustomerAnalysis';

interface SidebarProps {
  selectedArea: {
    pid: string;
    trade_area: number;
  } | null;
  placeFilterRadius: number;
  setPlaceFilterRadius: (radius: number) => void;
  placeFilterIndustries: string[];
  setPlaceFilterIndustries: (industries: string[]) => void;
  showPlaces: boolean;
  setShowPlaces: (show: boolean) => void;
  customerDataType: 'Trade Area' | 'Home Zipcodes';
  setCustomerDataType: (type: 'Trade Area' | 'Home Zipcodes') => void;
  customerPercentiles: string[];
  setCustomerPercentiles: (values: string[]) => void;
  showCustomerAreas: boolean;
  setShowCustomerAreas: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedArea,
  placeFilterRadius,
  setPlaceFilterRadius,
  placeFilterIndustries,
  setPlaceFilterIndustries,
  showPlaces,
  setShowPlaces,
  customerDataType,
  setCustomerDataType,
  customerPercentiles,
  setCustomerPercentiles,
  showCustomerAreas,
  setShowCustomerAreas
}) => {
  return (
    <div className="sidebar">
      <h3>Trade Area Details</h3>
      {selectedArea ? (
        <ul>
          <li><strong>PID:</strong> {selectedArea.pid}</li>
          <li><strong>Trade Area:</strong> {selectedArea.trade_area}</li>
        </ul>
      ) : (
        <p>Select a trade area on the map to see details.</p>
      )}

      <PlaceAnalysis
        placeFilterRadius={placeFilterRadius}
        setPlaceFilterRadius={setPlaceFilterRadius}
        placeFilterIndustries={placeFilterIndustries}
        setPlaceFilterIndustries={setPlaceFilterIndustries}
        showPlaces={showPlaces}
        setShowPlaces={setShowPlaces}
      />

      <CustomerAnalysis
        customerDataType={customerDataType}
        setCustomerDataType={setCustomerDataType}
        customerPercentiles={customerPercentiles}
        setCustomerPercentiles={setCustomerPercentiles}
        showCustomerAreas={showCustomerAreas}
        setShowCustomerAreas={setShowCustomerAreas}
      />
    </div>
  );
};

export default Sidebar;
