import React from 'react';

const iframeStyles = {
  width: '100%',
  height: '100vh',
  border: 'none',
};

function SignLanguageTranslator() {
  return (
    <iframe
      title="Sign Language Translator"
      src="/Sign-Language-Translator/index.html"
      style={iframeStyles}
    />
  );
}

export default SignLanguageTranslator;
