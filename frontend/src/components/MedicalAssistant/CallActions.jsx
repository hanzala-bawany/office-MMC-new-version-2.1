import { Button, Popconfirm } from "antd";
import {
  PhoneOutlined,
  UserSwitchOutlined,
  SoundOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";

const CallActions = ({
  canCall = true,
  canSpecific = false,
  canRepeat = false,
  canSkip = false,
  loading = false,
  onCall,
  onSpecific,
  onRepeat,
  onSkip,
}) => (
  <div className="grid grid-cols-2 gap-3">
    <Button
      type="primary"
      size="large"
      icon={<PhoneOutlined />}
      disabled={!canCall}
      loading={loading}
      onClick={onCall}
      className="col-span-2 !h-12 !rounded-xl !font-semibold"
    >
      Call Next Patient
    </Button>

    <Button
      size="large"
      icon={<UserSwitchOutlined />}
      disabled={!canSpecific}
      onClick={onSpecific}
      className="col-span-2 !h-12 !rounded-xl !font-medium"
    >
      Call Specific Patient
    </Button>

    <Button
      size="large"
      icon={<SoundOutlined />}
      disabled={!canRepeat}
      onClick={onRepeat}
      className="!h-12 !rounded-xl"
    >
      Repeat
    </Button>

    <Popconfirm
      title="Patient ko skip karna hai?"
      okText="Skip"
      cancelText="Cancel"
      disabled={!canSkip}
      onConfirm={onSkip}
    >
      <Button
        danger
        size="large"
        icon={<StepForwardOutlined />}
        disabled={!canSkip}
        className="!h-12 !rounded-xl w-full"
      >
        Skip
      </Button>
    </Popconfirm>
  </div>
);

export default CallActions;