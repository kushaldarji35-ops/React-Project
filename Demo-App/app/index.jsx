import { Image, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

import Logo from '../assets/image/logo_light.png'

const Home = () => {
  return (
    <View style={styles.container}>

      <Image source={Logo} style={styles.img} />

      <Text style={styles.title}>
        The Number 1
      </Text>

      <Text style={styles.subtitle}>
        Reading List App
      </Text>

      <View style={styles.links}>
        <Link href="/about" style={styles.link}>
          About Page
        </Link>

        <Link href="/contact" style={styles.link}>
          Contact Page
        </Link>
      </View>

    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0dfe8',
    alignItems: 'center',
    paddingTop: 180,
  },

  /*img: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
  },*/

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginTop: 10,
  },

  links: {
    marginTop: 40,
    alignItems: 'center',
    gap: 25,
  },

  link: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    borderBottomWidth: 1,
    paddingBottom: 3,
  },
})