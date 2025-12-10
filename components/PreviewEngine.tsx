import React from 'react';

interface PreviewEngineProps {
  code: string;
}

const PreviewEngine: React.FC<PreviewEngineProps> = ({ code }) => {
  return (
    <div className="w-full h-full bg-white">
      <iframe
        srcDoc={code}
        title="App Preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
};

export default PreviewEngine;