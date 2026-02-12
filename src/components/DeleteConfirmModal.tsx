interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="xform-modal-overlay" onClick={onCancel}>
      <div className="xform-delete-modal xform-delete-modal-mild" onClick={(e) => e.stopPropagation()}>
        <div className="xform-delete-modal-icon">
          <i className="bi bi-question-circle" />
        </div>
        <p className="xform-delete-modal-msg">{message}</p>
        <div className="xform-delete-modal-actions">
          <button className="btn btn-sm xform-btn-cancel" onClick={onCancel}>取消</button>
          <button className="btn btn-sm xform-btn-confirm-delete" onClick={onConfirm}>確定刪除</button>
        </div>
      </div>
    </div>
  );
}
