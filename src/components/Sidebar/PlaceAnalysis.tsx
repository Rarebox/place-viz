import React from 'react';

interface Props {
  placeFilterRadius: number;
  setPlaceFilterRadius: (value: number) => void;
  placeFilterIndustries: string[];
  setPlaceFilterIndustries: (industries: string[]) => void;
  showPlaces: boolean;
  setShowPlaces: (show: boolean) => void;
}

const allIndustries = ['Retail', 'Restaurant', 'Service', 'Other'];

const PlaceAnalysis: React.FC<Props> = ({
  placeFilterRadius,
  setPlaceFilterRadius,
  placeFilterIndustries,
  setPlaceFilterIndustries,
  showPlaces,
  setShowPlaces
}) => {
  const toggleIndustry = (industry: string) => {
    if (placeFilterIndustries.includes(industry)) {
      setPlaceFilterIndustries(placeFilterIndustries.filter(i => i !== industry));
    } else {
      setPlaceFilterIndustries([...placeFilterIndustries, industry]);
    }
  };

  return (
    <div>
      <h4>📦 Place Analysis</h4>

      <label>
        Radius (km):
        <input
          type="number"
          min={1}
          value={placeFilterRadius}
          onChange={(e) => setPlaceFilterRadius(Number(e.target.value))}
        />
      </label>

      <fieldset>
        <legend>Industries</legend>
        {allIndustries.map((industry) => (
          <label key={industry}>
            <input
              type="checkbox"
              checked={placeFilterIndustries.includes(industry)}
              onChange={() => toggleIndustry(industry)}
            />
            {industry}
          </label>
        ))}
      </fieldset>

      <label>
        <input
          type="checkbox"
          checked={showPlaces}
          onChange={(e) => setShowPlaces(e.target.checked)}
        />
        Show Places
      </label>
    </div>
  );
};

export default PlaceAnalysis;
