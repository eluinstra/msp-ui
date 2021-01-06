import { ThreeDRotationRounded } from "@material-ui/icons";

export const ImuCmd =
{
  IMU_IDLE: 0,
  IMU_TIME:   1,   //out message
  IMU_ACC: 2,
  IMU_ANGLULAR: 3,
  IMU_ANGLE: 4,
  IMU_MSG_RECEIVED: 96,
  IMU_COMMAND_RECEIVED: 97,
  IMU_COMMAND_IDLE: 98,
  IMU_ERROR_RECEIVED: 99,
  //DEPRECATED -
  IMU_IDENT:       100    //out message         mixerMode + multiwii version + protocol version + capability variable
};

export const imuCmdHeader = '';

export const imuMessageType =
{
  OUT: "<",
  IN: ">",
  ERROR: "!"
}
