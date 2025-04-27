import { Accessor } from 'solid-js';

export type StatusBarProps = {
  totalChanges: Accessor<number>;
  shownChanges: Accessor<number>;
  visibleMatches: Accessor<number>;
  totalMatches: Accessor<number>;
};

export const StatusBar = (props: StatusBarProps) => {
  const matchMessage = () => {
    const visible = props.visibleMatches();
    const total = props.totalMatches();
    return `Showing ${visible} out of ${total} matches.`;
  };
  const changeMessage = () => {
    const total = props.totalChanges();
    const shown = props.shownChanges();

    if (total === 0) {
      return 'Changes: 0';
    }
    if (shown === total) {
      return `Changes: ${total} (all shown)`;
    }
    if (shown === 0) {
      return `Changes: ${total} (hidden by filter)`;
    }
    const hidden = total - shown;
    return `Changes: ${total} (${shown} shown, ${hidden} hidden by filter)`;
  };

  return (
    <div>
      <p>{matchMessage()}</p>
      <p>{changeMessage()}</p>
    </div>
  );
};
