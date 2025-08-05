import React from 'react';

interface Props {
  customerDataType: 'Trade Area' | 'Home Zipcodes';
  setCustomerDataType: (type: 'Trade Area' | 'Home Zipcodes') => void;
  customerPercentiles: string[];
  setCustomerPercentiles: (values: string[]) => void;
  showCustomerAreas: boolean;
  setShowCustomerAreas: (show: boolean) => void;
}

const CustomerAnalysis: React.FC<Props> = ({
  customerDataType,
  setCustomerDataType,
  customerPercentiles,
  setCustomerPercentiles,
  showCustomerAreas,
  setShowCustomerAreas
}) => {
  const togglePercentile = (value: string) => {
    if (customerPercentiles.includes(value)) {
      setCustomerPercentiles(customerPercentiles.filter(v => v !== value));
    } else {
      setCustomerPercentiles([...customerPercentiles, value]);
    }
  };

  return (
    <div>
      <h4>📦 Customer Analysis</h4>

      <label>
        Data Type:
        <select
          value={customerDataType}
          onChange={(e) => setCustomerDataType(e.target.value as 'Trade Area' | 'Home Zipcodes')}
        >
          <option value="Trade Area">Trade Area</option>
          <option value="Home Zipcodes">Home Zipcodes</option>
        </select>
      </label>

      {customerDataType === 'Trade Area' && (
        <fieldset>
          <legend>Percentiles</legend>
          {['30', '50', '70'].map(p => (
            <label key={p}>
              <input
                type="checkbox"
                checked={customerPercentiles.includes(p)}
                onChange={() => togglePercentile(p)}
              />
              %{p}
            </label>
          ))}
        </fieldset>
      )}

      <label>
        <input
          type="checkbox"
          checked={showCustomerAreas}
          onChange={(e) => setShowCustomerAreas(e.target.checked)}
        />
        Show Customer Areas
      </label>
    </div>
  );
};

export default CustomerAnalysis;
