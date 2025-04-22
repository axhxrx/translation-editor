import { Base, MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import './app.css';

export default function App()
{
  return (
    <Router
      base='/translation-editor/'
      root={props => (
        <MetaProvider>
          <Title>Translation Editor</Title>
          <a href='/translation-editor'>Translation Editor</a>
          &nbsp;&bull;&nbsp;
          <a href='/translation-editor/about'>About</a>
          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
