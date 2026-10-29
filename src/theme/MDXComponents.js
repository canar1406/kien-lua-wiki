import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import FirstAidAssistant from '@site/src/components/FirstAidAssistant';

// Bọc mọi bảng markdown trong div scroll ngang
// đây là cách chính thức của Docusaurus để làm bảng responsive
function ResponsiveTable({ children, ...props }) {
  return (
    <div style={{
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      width: '100%',
      marginBottom: '1.25rem',
      borderRadius: '8px',
    }}>
      <table {...props}>{children}</table>
    </div>
  );
}

export default {
  ...MDXComponents,
  table: ResponsiveTable,
  FirstAidAssistant,
};
