import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

// Bọc mọi bảng markdown trong div scroll ngang
// đây là cách chính thức của Docusaurus để làm bảng responsive
function ResponsiveTable({ children, ...props }) {
  return (
    <div style={{
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      width: '100%',
      marginBottom: '1rem',
    }}>
      <table {...props}>{children}</table>
    </div>
  );
}

export default {
  ...MDXComponents,
  table: ResponsiveTable,
};
