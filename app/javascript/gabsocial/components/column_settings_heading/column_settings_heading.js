export default class ColumnSettingsHeading extends PureComponent {
  static propTypes = {
    heading: PropTypes.object.isRequired,
    id: PropTypes.string,
  };

  render() {
    const { heading, id } = this.props;

    return (
      <span id={id} className='column-settings-heading'>{heading}</span>
    )
  }
}