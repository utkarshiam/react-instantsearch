import React, { Component } from 'react';
import { translatable, Translate } from 'react-instantsearch-core';
import { createClassNames } from '../core/utils';
import voiceSearchHelper, {
  VoiceSearchHelper,
  VoiceListeningState,
} from '../lib/voiceSearchHelper';
const cx = createClassNames('VoiceSearch');

type InnerComponentProps = {
  status: string;
  errorCode?: string;
  isListening: boolean;
  transcript?: string;
  isSpeechFinal?: boolean;
  isBrowserSupported: boolean;
};

type VoiceSearchProps = {
  searchAsYouSpeak?: boolean;
  language?: string;
  additionalQueryParameters?: (params: { query: string }) => {} | void;

  refine: (query: string) => void;
  translate: Translate;
  buttonComponent?: React.FC<InnerComponentProps>;
  statusComponent?: React.FC<InnerComponentProps>;
};

const getDefaultButtonInnerElement = (
  status: string,
  errorCode: string | undefined,
  isListening: boolean
) => {
  if (status === 'error' && errorCode === 'not-allowed') {
    return (
      <>
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </>
    );
  }
  return (
    <>
      <path
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
        fill={isListening ? 'currentColor' : ''}
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </>
  );
};

const DefaultButton: React.FC<InnerComponentProps> = ({
  status,
  errorCode,
  isListening,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {getDefaultButtonInnerElement(status, errorCode, isListening)}
    </svg>
  );
};

const DefaultStatus: React.FC<InnerComponentProps> = ({ transcript }) => (
  <p>{transcript}</p>
);

class VoiceSearch extends Component<VoiceSearchProps, VoiceListeningState> {
  private voiceSearch: VoiceSearchHelper;

  constructor(props: VoiceSearchProps) {
    super(props);
    const { searchAsYouSpeak = false, language, refine } = props;
    this.voiceSearch = voiceSearchHelper({
      searchAsYouSpeak,
      language,
      onQueryChange: query => refine(query),
      onStateChange: () => {
        this.setState(this.voiceSearch.getState());
      },
    });
    this.state = this.voiceSearch.getState();
  }

  public render() {
    const { status, transcript, isSpeechFinal, errorCode } = this.state;
    const { isListening, isBrowserSupported } = this.voiceSearch;
    const {
      translate,
      buttonComponent: Button = DefaultButton,
      statusComponent: Status = DefaultStatus,
    } = this.props;
    const innerProps: InnerComponentProps = {
      status,
      errorCode,
      isListening: isListening(),
      transcript,
      isSpeechFinal,
      isBrowserSupported: isBrowserSupported(),
    };

    return (
      <div className={cx('')}>
        <button
          className={cx('button')}
          type="button"
          title={
            isBrowserSupported()
              ? translate('buttonTitle')
              : translate('disabledButtonTitle')
          }
          onClick={this.onClick}
          disabled={!isBrowserSupported()}
        >
          <Button {...innerProps} />
        </button>
        <div className={cx('status')}>
          <Status {...innerProps} />
        </div>
      </div>
    );
  }

  private onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.blur();
    const { toggleListening } = this.voiceSearch;
    toggleListening();
  };
}

<VoiceSearch additionalQueryParameters={({nose: bone}) => {}} />

export default translatable({
  buttonTitle: 'Search by voice',
  disabledButtonTitle: 'Search by voice (not supported on this browser)',
})(VoiceSearch);
