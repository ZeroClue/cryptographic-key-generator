import React from 'react';
import { Tooltip } from 'react-tooltip';
import type { Algorithm } from '../../constants';

interface AlgorithmTooltipProps {
  algorithm: Algorithm;
  children: React.ReactNode;
}

const AlgorithmTooltip: React.FC<AlgorithmTooltipProps> = ({ algorithm, children }) => {
  return (
    <>
      <div
        data-tooltip-id={`algorithm-tooltip-${algorithm.value}`}
        data-tooltip-content={algorithm.description}
        data-tooltip-place="top"
        className="cursor-help"
      >
        {children}
      </div>
      <Tooltip
        id={`algorithm-tooltip-${algorithm.value}`}
        className="tooltip-custom"
        style={{
          backgroundColor: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '14px',
          maxWidth: '320px',
          zIndex: 50,
        }}
      />
    </>
  );
};

export default AlgorithmTooltip;