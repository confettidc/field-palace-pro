interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="xform-modal-overlay" onClick={onCancel}>
      <div className="xform-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="xform-delete-modal-icon">
          <i className="bi bi-exclamation-triangle-fill" />
        </div>
        <p className="xform-delete-modal-msg">{message}</p>
        <div className="xform-delete-modal-actions">
          <button className="btn btn-sm btn-light" onClick={onCancel}>取消</button>
          <button className="btn btn-sm btn-danger" onClick={onConfirm}>確定刪除</button>
        </div>
      </div>
    </div>
  );
}
