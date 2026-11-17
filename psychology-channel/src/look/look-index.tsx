import React from 'react';
import { registerRoot } from 'remotion';
import { LookAuditRoot, LookVariantsRoot, EyeStudyRoot } from './LookAudit';

const LookRoots: React.FC = () => (
  <>
    <LookAuditRoot />
    <LookVariantsRoot />
    <EyeStudyRoot />
  </>
);

registerRoot(LookRoots);
