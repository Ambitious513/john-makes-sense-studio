import React from 'react';
import { registerRoot } from 'remotion';
import { HeadSlotAuditRoot, LookAuditRoot, LookVariantsRoot, EyeStudyRoot } from './LookAudit';

const LookRoots: React.FC = () => (
  <>
    <LookAuditRoot />
    <LookVariantsRoot />
    <EyeStudyRoot />
    <HeadSlotAuditRoot />
  </>
);

registerRoot(LookRoots);
