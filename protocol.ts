export const mspCMD = {
  MSP_API_VERSION:   1,   //out message
  MSP_FC_VARIANT:    2,   //out message
  MSP_FC_VERSION:    3,   //out message
  MSP_BOARD_INFO:    4,   //out message
  MSP_BUILD_INFO:    5,   //out message
  MSP_NAME:         10,   //out message          Returns user set board name - betaflight
  MSP_SET_NAME:     11,   //in message           Sets board name - betaflight
  //DEPRECATED -
  MSP_IDENT:       100    //out message         mixerMode + multiwii version + protocol version + capability variable
};

export const mspCMDHeader = '$X<';

export const mspMessageType = {
  OUT: "<",
  IN: ">",
  ERROR: "!"
}
