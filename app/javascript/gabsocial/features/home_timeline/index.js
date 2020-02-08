import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { expandHomeTimeline } from '../../actions/timelines';
import StatusListContainer from '../../containers/status_list_container';
import ColumnSettings from './components/column_settings';
import Column from '../../components/column';
import { HomeColumnHeader } from '../../components/column_header';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const mapStateToProps = state => ({
  hasUnread: state.getIn(['timelines', 'home', 'unread']) > 0,
  isPartial: state.getIn(['timelines', 'home', 'isPartial']),
});

export default @connect(mapStateToProps)
@injectIntl
class HomeTimeline extends PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    hasUnread: PropTypes.bool,
    isPartial: PropTypes.bool,
  };

  handleLoadMore = maxId => {
    this.props.dispatch(expandHomeTimeline({ maxId }));
  }

  componentDidMount () {
    this._checkIfReloadNeeded(false, this.props.isPartial);
  }

  componentDidUpdate (prevProps) {
    this._checkIfReloadNeeded(prevProps.isPartial, this.props.isPartial);
  }

  componentWillUnmount () {
    this._stopPolling();
  }

  _checkIfReloadNeeded (wasPartial, isPartial) {
    const { dispatch } = this.props;

    if (wasPartial === isPartial) {
      return;
    } else if (!wasPartial && isPartial) {
      this.polling = setInterval(() => {
        dispatch(expandHomeTimeline());
      }, 3000);
    } else if (wasPartial && !isPartial) {
      this._stopPolling();
    }
  }

  _stopPolling () {
    if (this.polling) {
      clearInterval(this.polling);
      this.polling = null;
    }
  }

  render () {
    const { intl, hasUnread } = this.props;

    return (
      <Column heading={intl.formatMessage(messages.title)}>
        <StatusListContainer
          scrollKey='home_timeline'
          onLoadMore={this.handleLoadMore}
          timelineId='home'
          emptyMessage={<FormattedMessage id='empty_column.home' defaultMessage='Your home timeline is empty. Start following other users to recieve their content here.'/>}
        />
      </Column>
    );
  }

}
