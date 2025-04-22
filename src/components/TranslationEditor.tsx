import { Component, createEffect, createSignal, Match, Show, Switch } from 'solid-js';
import { EditableNode } from '../EditableNode.ts';

interface TranslationEditorProps
{
  entry: {
    path: string[];
    value: {
      en?: string;
      ja?: string;
      proposedEn?: string;
      proposedJa?: string;
    };
  };
  initialProposedChanges: Record<string, EditableNode>;
  onProposedChange: (path: string[], node: EditableNode) => void;
}

const TranslationEditor: Component<TranslationEditorProps> = (props) =>
{
  /**
   This component displays an item that is a combination the current value in the filtered tree, and any proposed changes (which are app-local state, and don't come from the filtered tree). This prop just tracks the *initial* one which is passed in by the parent component; this is only to set the initial value of
   */
  const initialProposedChangeValue = props.initialProposedChanges[JSON.stringify(props.entry.path)];

  /**
   After the initial render, this tracks the proposed changes for this entry.
   */
  const [proposedChange, setProposedChange] = createSignal<{ en?: string; ja?: string }>({
    en: undefined,
    ja: undefined,
  });

  /**
   Using createEffect to set the initial value of proposedChange avoids the SolidJS issue of "Hydration Mismatch. Unable to find DOM nodes for hydration key: 0000000010000030000003220 <tr><td><textarea></textarea></td><td><textarea></textarea></td></tr>". I am still a little fuzzy on this, but it seems that modifying the DOM based on `props` can cause SolidJS to shit its pants when using `<Show>` and `<Match>`. But making sure conditional rendering is based on signals/effects that exist after the initial render, not the initial props, seems to avoid this issue. (This was my first 🫤 moment with SolidJS... admittedly could be a n00b skill issue, but it seems like there are infinite possible subtle fuckups one could inadvertently cause, where the code works most of the time and quasi-randomly fails with hydration errors only some of the time.)
   */
  createEffect(() =>
  {
    const initial = initialProposedChangeValue;
    if (initial)
    {
      setProposedChange({
        en: initial.en,
        ja: initial.ja,
      });
    }
    else
    {
      setProposedChange({ en: undefined, ja: undefined });
    }
  });

  /**
   Returns true if there is a proposed change for this entry (in which case we show the extras edit fields).
   */
  const hasProposedChange = () => proposedChange().en !== undefined || proposedChange().ja !== undefined;

  /**
   Deletes the proposed change for this entry, which causes the edit fields to hide.
   */
  const deleteProposedChange = () =>
  {
    setProposedChange({
      en: undefined,
      ja: undefined,
    });
    emitProposedChange();
  };

  /**
   Handles the "Propose Change" button click, setting the proposed change to the current values and enabling editing.
   */
  const handleProposeChangeButtonClick = () =>
  {
    setProposedChange({
      en: props.entry.value.en,
      ja: props.entry.value.ja,
    });
  };

  /**
   The parent is the one who must persist the proposed changes, so we emit them on every keystroke. Since everything is local and no API calls happen for this, it seems so far to be fine to just blast it out on every keystroke. (Maybe need check for slow-ass devices like phones?)
   */
  const emitProposedChange = () =>
  {
    console.log('EMIT PROPOSED CHANGE', proposedChange);
    props.onProposedChange(props.entry.path, {
      en: proposedChange().en,
      ja: proposedChange().ja,
    });
  };

  return (
    <table
      style={{
        border: '3px outsetrgb(192, 192, 192)',
        'border-collapse': 'separate',
        'border-spacing': '2px',
        'background-color': '#efefef',
        'font-family': 'Tahoma, Arial, sans-serif',
        'box-shadow': '2px 2px 6px #888888',
        width: '100%',
      }}
    >
      <thead>
        <tr>
          <th
            colSpan={3}
            style={{
              'background-color': '#0000aa',
              color: 'white',
              'font-weight': 'bold',
              'text-align': 'center',
              padding: '4px',
              border: '2px outset #c0c0c0',
              'font-size': 'x-small',
            }}
          >
            {props.entry.path[0]}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            colSpan={2}
            style={{
              'font-weight': 'bold',
              padding: '6px',
              border: '2px inset #c0c0c0',
              'background-color': '#d0d0d0',
            }}
          >
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
              }}
            >
              {props.entry.path.slice(1).join(' ▹ ')}
              <Switch>
                <Match
                  when={hasProposedChange()}
                >
                  <button onClick={deleteProposedChange}>
                    Delete Proposed Change
                  </button>
                </Match>
                <Match
                  when={!hasProposedChange()}
                >
                  <button onClick={handleProposeChangeButtonClick}>Propose Change</button>
                </Match>
              </Switch>
            </div>
          </td>
        </tr>
        <tr>
          <td
            style={{
              padding: '4px',
              border: '2px inset #c0c0c0',
              width: '50%',
            }}
          >
            {props.entry.value.en}
          </td>
          <td
            style={{
              padding: '4px',
              border: '2px inset #c0c0c0',
              width: '50%',
            }}
          >
            {props.entry.value.ja}
          </td>
        </tr>
        <Show
          when={hasProposedChange()}
        >
          <tr
            style={{
              padding: '4px',
              border: '2px inset #c0c0c0',
              width: '100%',
            }}
          >
            <td>
              <div style={{ margin: '0' }}>
                <textarea
                  style={{
                    height: '5em',
                    'min-width': '100%',
                    'min-height': '100%',
                    'box-sizing': 'border-box',
                    'margin-top': '0',
                    'margin-bottom': '0',
                    resize: 'vertical',
                  }}
                  value={proposedChange().en}
                  onInput={(e) =>
                  {
                    const newValue = e.target.value;
                    const currentChange = proposedChange();
                    setProposedChange({ ...currentChange, en: newValue });
                    emitProposedChange();
                  }}
                />
              </div>
            </td>
            <td>
              <div style={{ margin: '0' }}>
                <textarea
                  style={{
                    height: '5em',
                    'min-width': '100%',
                    'min-height': '100%',
                    'box-sizing': 'border-box',
                    'margin-top': '0',
                    'margin-bottom': '0',
                    resize: 'vertical',
                  }}
                  value={proposedChange().ja}
                  onInput={(e) =>
                  {
                    const newValue = e.target.value;
                    const currentChange = proposedChange();
                    setProposedChange({ ...currentChange, ja: newValue });
                    emitProposedChange();
                  }}
                />
              </div>
            </td>
          </tr>
        </Show>
      </tbody>
    </table>
  );
};

export default TranslationEditor;
