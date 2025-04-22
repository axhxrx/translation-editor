import { Title } from '@solidjs/meta';

export default function About()
{
  return (
    <main style='max-width: 28em; margin: 0 auto;'>
      <Title>About Translation Editor</Title>
      <p>
        This application is intended to help stakeholders of all kind find, and suggest improvements to, the
        multi-lingual translations used in the app.
      </p>
      <p>
        Note that this can also be used to find phrases in the UI which are confusing, or technically incorrect, or
        which need to be updated.
      </p>
      <p>
        When done suggesting, you can press "Finalize" to automatically create a pull request with your suggested
        changes.
      </p>
      <p>
        Thank you for your help!
      </p>
    </main>
  );
}
