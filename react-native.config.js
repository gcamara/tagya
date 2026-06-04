// Impede o autolinking nativo de integrar os pacotes Capacitor que vêm como
// dependência transitiva da @mmote/niimbluelib (a gente usa react-native-ble-plx,
// não Capacitor). Sem isso, o pod install do iOS quebra com erro de Swift/Capacitor.
module.exports = {
  dependencies: {
    '@capacitor/core': { platforms: { ios: null, android: null } },
    '@capacitor-community/bluetooth-le': { platforms: { ios: null, android: null } },
  },
};
