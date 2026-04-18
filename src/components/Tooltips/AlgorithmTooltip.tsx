import React from 'react';
import { Tooltip } from 'react-tooltip';
import { ALGORITHM_EDUCATIONAL_CONTENT, KEY_SIZE_EDUCATIONAL_CONTENT } from '../../constants';
import type { Algorithm } from '../../constants';

type ContentType = 'algorithm' | 'keySize';

interface AlgorithmTooltipProps {
  algorithm: Algorithm;
  children: React.ReactNode;
  contentType?: ContentType;
  keySize?: string;
}

const AlgorithmTooltip: React.FC<AlgorithmTooltipProps> = ({
  algorithm,
  children,
  contentType = 'algorithm',
  keySize
}) => {
  const getTooltipContent = () => {
    // Start with algorithm educational content
    const algorithmContent = ALGORITHM_EDUCATIONAL_CONTENT[algorithm.value];

    if (!algorithmContent) {
      return null;
    }

    let content = { ...algorithmContent };

    // If we're showing key size info, append it
    if (contentType === 'keySize' && keySize) {
      const keySizeContent = KEY_SIZE_EDUCATIONAL_CONTENT[keySize];
      if (keySizeContent) {
        content = {
          ...content,
          description: `${content.description}\n\n**Key Size:** ${keySizeContent.title}\n${keySizeContent.description}`,
          securityLevel: keySizeContent.securityLevel,
        };
      }
    }

    return content;
  };

  const tooltipContent = getTooltipContent();

  if (!tooltipContent) {
    return <>{children}</>;
  }

  const tooltipId = contentType === 'keySize' && keySize
    ? `algorithm-tooltip-${algorithm.value}-${keySize}`
    : `algorithm-tooltip-${algorithm.value}`;

  return (
    <>
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-place="top"
        className="cursor-help"
      >
        {children}
      </div>
      <Tooltip
        id={tooltipId}
        className="tooltip-custom"
        style={{
          backgroundColor: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '400px',
          zIndex: 50,
          lineHeight: '1.5',
        }}
        render={() => (
          <div className="tooltip-content">
            <div className="font-semibold text-white mb-2">{tooltipContent.title}</div>
            <div className="text-gray-300 text-sm mb-3">
              {tooltipContent.description}
            </div>
            {tooltipContent.securityLevel && (
              <div className="text-xs text-blue-400 mb-2">
                <span className="font-medium">Security:</span> {tooltipContent.securityLevel}
              </div>
            )}
            {tooltipContent.useCases && tooltipContent.useCases.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-400 mb-1">Use cases:</div>
                <ul className="text-xs text-gray-400 list-disc list-inside">
                  {tooltipContent.useCases.map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              </div>
            )}
            <a
              href={tooltipContent.learnMoreUrl}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium inline-flex items-center"
            >
              Learn more →
            </a>
          </div>
        )}
      />
    </>
  );
};

export default AlgorithmTooltip;