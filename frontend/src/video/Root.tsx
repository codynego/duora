import {Composition} from 'remotion';
import {InvoiceFlowLaunch} from './InvoiceFlowLaunch';

export const RemotionRoot = () => (
  <Composition
    id="InvoiceFlowLaunch"
    component={InvoiceFlowLaunch}
    durationInFrames={540}
    fps={30}
    width={1920}
    height={1080}
  />
);
