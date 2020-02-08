import ImmutablePropTypes from 'react-immutable-proptypes';
import StatusContent from '../status_content';
import DisplayName from '../display_name';
import { NavLink } from 'react-router-dom';

const mapStateToProps = (state, { id }) => ({
  status: state.getIn(['statuses', id]),
  account: state.getIn(['accounts', state.getIn(['statuses', id, 'account'])]),
});

@connect(mapStateToProps)
export default class StatusQuote extends PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
  };

  render() {
    const { status, account } = this.props;

    const statusUrl = `/${account.get('acct')}/posts/${status.get('id')}`;

    return (
      <NavLink to={statusUrl} className="status__quote">
        <DisplayName account={account} />
        <StatusContent
          status={status}
          expanded={false}
          onClick
          collapsable
        />
      </NavLink>
    );
  }

}