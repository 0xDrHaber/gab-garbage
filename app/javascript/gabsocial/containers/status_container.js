import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import {
  replyCompose,
  mentionCompose,
  quoteCompose,
} from '../actions/compose';
import {
  reblog,
  favorite,
  unreblog,
  unfavorite,
  pin,
  unpin,
} from '../actions/interactions';
import { blockAccount } from '../actions/accounts';
import {
  muteStatus,
  unmuteStatus,
  deleteStatus,
  editStatus,
  hideStatus,
  revealStatus,
} from '../actions/statuses';
import { initMuteModal } from '../actions/mutes';
import { initReport } from '../actions/reports';
import { openModal } from '../actions/modal';
import { boostModal, deleteModal } from '../initial_state';
import { showAlertForError } from '../actions/alerts';
import { 
  createRemovedAccount,
  groupRemoveStatus
} from '../actions/groups';
import { makeGetStatus } from '../selectors';
import Status from '../components/status';

const messages = defineMessages({
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this status?' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  replyConfirm: { id: 'confirmations.reply.confirm', defaultMessage: 'Reply' },
  replyMessage: { id: 'confirmations.reply.message', defaultMessage: 'Replying now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  quoteConfirm: { id: 'confirmations.quote.confirm', defaultMessage: 'Quote' },
  quoteMessage: { id: 'confirmations.quote.message', defaultMessage: 'Quoting now will overwrite the message you are currently composing. Are you sure you want to proceed?' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, props) => ({
    status: getStatus(state, props),
    replies: state.getIn(['contexts', 'replies', props.id]),
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { intl }) => ({

  onReply (status, router) {
    dispatch((_, getState) => {
      let state = getState();
      if (state.getIn(['compose', 'text']).trim().length !== 0) {
        dispatch(openModal('CONFIRM', {
          message: intl.formatMessage(messages.replyMessage),
          confirm: intl.formatMessage(messages.replyConfirm),
          onConfirm: () => dispatch(replyCompose(status, router)),
        }));
      } else {
        dispatch(replyCompose(status, router));
      }
    });
  },

  onQuote (status, router) {
    dispatch((_, getState) => {
      let state = getState();
      if (state.getIn(['compose', 'text']).trim().length !== 0) {
        dispatch(openModal('CONFIRM', {
          message: intl.formatMessage(messages.quoteMessage),
          confirm: intl.formatMessage(messages.quoteConfirm),
          onConfirm: () => dispatch(quoteCompose(status, router)),
        }));
      } else {
        dispatch(quoteCompose(status, router));
      }
    });
  },

  onModalRepost (status) {
    if (status.get('reblogged')) {
      dispatch(unrepost(status));
    } else {
      dispatch(repost(status));
    }
  },

  onRepost (status, e) {
    if (e.shiftKey || !boostModal) {
      this.onModalRepost(status);
    } else {
      dispatch(openModal('BOOST', { status, onRepost: this.onModalRepost }));
    }
  },

  onShowRevisions (status) {
    dispatch(openModal('STATUS_REVISION', { status }));
  },

  onFavorite (status) {
    console.log("onFavorite...", status)
    if (status.get('favourited')) {
      console.log("unfav...")
      dispatch(unfavorite(status));
    } else {
      console.log("fav...")
      dispatch(favorite(status));
    }
  },

  onPin (status) {
    if (status.get('pinned')) {
      dispatch(unpin(status));
    } else {
      dispatch(pin(status));
    }
  },

  onEmbed (status) {
    dispatch(openModal('EMBED', {
      url: status.get('url'),
      onError: error => dispatch(showAlertForError(error)),
    }));
  },

  onDelete (status, history) {
    if (!deleteModal) {
      dispatch(deleteStatus(status.get('id'), history));
    } else {
      dispatch(openModal('CONFIRM', {
        message: intl.formatMessage(messages.deleteMessage),
        confirm: intl.formatMessage(messages.deleteConfirm),
        onConfirm: () => dispatch(deleteStatus(status.get('id'), history)),
      }));
    }
  },

  onEdit (status) {
    dispatch(editStatus(status));
  },

  onMention (account, router) {
    dispatch(mentionCompose(account, router));
  },

  onOpenMedia (media, index) {
    dispatch(openModal('MEDIA', { media, index }));
  },

  onOpenVideo (media, time) {
    dispatch(openModal('VIDEO', { media, time }));
  },

  onBlock (status) {
    const account = status.get('account');
    dispatch(openModal('CONFIRM', {
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.get('id'))),
      secondary: intl.formatMessage(messages.blockAndReport),
      onSecondary: () => {
        dispatch(blockAccount(account.get('id')));
        dispatch(initReport(account, status));
      },
    }));
  },

  onReport (status) {
    dispatch(initReport(status.get('account'), status));
  },

  onMute (account) {
    dispatch(initMuteModal(account));
  },

  onMuteConversation (status) {
    if (status.get('muted')) {
      dispatch(unmuteStatus(status.get('id')));
    } else {
      dispatch(muteStatus(status.get('id')));
    }
  },

  onToggleHidden (status) {
    if (status.get('hidden')) {
      dispatch(revealStatus(status.get('id')));
    } else {
      dispatch(hideStatus(status.get('id')));
    }
  },

  onGroupRemoveAccount(groupId, accountId) {
    dispatch(createRemovedAccount(groupId, accountId));
  },

  onGroupRemoveStatus(groupId, statusId) {
    dispatch(groupRemoveStatus(groupId, statusId));
  },

  onOpenProUpgradeModal() {
    dispatch(openModal('PRO_UPGRADE'));
  },

});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(Status));
