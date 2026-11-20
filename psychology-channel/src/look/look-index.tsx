import React from 'react';
import { registerRoot } from 'remotion';
import { HeadSlotAuditRoot, LookAuditRoot, LookVariantsRoot, EyeStudyRoot } from './LookAudit';
import { SweaterMatchRoot } from './SweaterMatch';

const LookRoots: React.FC = () => (
  <>
    <LookAuditRoot />
    <LookVariantsRoot />
    <EyeStudyRoot />
    <HeadSlotAuditRoot />
    <SweaterMatchRoot />
  </>
);

registerRoot(LookRoots);
