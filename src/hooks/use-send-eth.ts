import { useCallback, useState } from 'react';
import type {
  BatchFundRequest,
  BatchFundResponse,
  ErrorResponse
} from '@/app/api/batch-fund/route';

const useSendEthWithFunder = () => {
  const [isBatchFunding, setIsBatchFunding] = useState(false);
  const [hasAttemptedFunding, setHasAttemptedFunding] = useState(false);
  const [isFunded, setIsFunded] = useState(false);

  const batchSendEthUsingFunder = useCallback(
    async (data: BatchFundRequest[]) => {
      if (hasAttemptedFunding) return;

      try {
        setIsBatchFunding(true);
        const response = await fetch('/api/batch-fund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorResult: ErrorResponse = await response.json();
          throw new Error(errorResult.error);
        }

        const result: BatchFundResponse = await response.json();
        setIsBatchFunding(false);
        setHasAttemptedFunding(true);
        setIsFunded(true);
        return result.hashes;
      } catch (error) {
        console.error('Error while batch funding:', error);
        setIsBatchFunding(false);
        setHasAttemptedFunding(true);
      }
    },
    [hasAttemptedFunding]
  );

  return {
    batchSendEthUsingFunder,
    isBatchFunding,
    hasAttemptedFunding,
    isFunded
  };
};

export default useSendEthWithFunder;
