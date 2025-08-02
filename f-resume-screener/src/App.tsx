import { ThemeProvider } from '@primer/react';
import ParticleBackground from './components/ParticleBackground';
import UploadForm from './components/UploadForm';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-color: #0d1117;
`;

function App() {
  return (
    <ThemeProvider colorMode="dark">
      <AppContainer>
        <ParticleBackground />
        <UploadForm />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App
