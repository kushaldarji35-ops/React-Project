import { Link } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

const Contact = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Page</Text>

      <Link href="/" style={styles.link}>Home Page</Link>
    </View>
  )
}

export default Contact

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e0dfe8',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  links: {
    marginTop: 40,
    alignItems: 'center',
  },

  link: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    borderBottomWidth: 1,
    paddingBottom: 3,
    marginVertical:5,
  },
})