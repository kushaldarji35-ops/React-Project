
import "./Home.css";
import { Navbar } from "../../components/Navbar/Navbar";
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import ImageSlider from "../../components/ImageSlider/ImageSlider";
import Categories from "../../components/Categories/Categories";
import NewArrivals from "../../components/NewArrivals/NewArrivals";
import Footer from "../../components/Footer/Footer";

function Home() {
    return (
        <>
        <Navbar/>

        <HeroBanner />
            <div className="home-collections">
            <h1>Our Collection</h1>
            <h2>Explore our newly launched collection</h2>
            <ImageSlider />
        </div>

        <div className="home-categories">
            <h1>Find Your Perfect Match</h1>
            <h2>Shop by Categories</h2>
            <Categories />
        </div>

        <div className="home-arrivals">
            <h1>Discover What's New</h1>
            <h2>New Arrivals</h2>
            <NewArrivals />
        </div>

       <Footer/>

        
        </>
    );
}

export default Home;
