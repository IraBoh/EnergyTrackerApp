import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  energyContainer: {
    alignItems: 'center',
    marginTop: 50,

  },
  energyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyBody: {
    width: 250,
    height: 80,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  energyFill: {
    height: '100%',
  },
  energyCap: {
    width: 10,
    height: 30,
    marginLeft: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  energyText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
