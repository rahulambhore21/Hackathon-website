import ai from "../../assets/feature.png";
import "./Feature.css";
import { Link } from "react-router-dom";

const Features = () => {
  return (
    <section
      id='about-us'
      className='bg-black text-white flex justify-between items-center max-lg:flex-col gap-10 w-full max-container sm:px-16 px-8 sm:py-24 py-12 align-center'
    >
      <div className='flex flex-1 flex-col border-2 border-[#FF4820] p-8 rounded-xl font-bold shadow-lg shadow-[#FF4820]/20 hover:shadow-[#FF4820]/30 transition-all duration-300'>
        <h2 className='font-palanquin capitalize text-5xl lg:max-w-lg font-bold'>
          Discover
          <span className='text-[#FF4820]'> Exciting </span>
          <span className='text-[#FF4820]'>Hackathons</span> Near You
        </h2>
        <p className='mt-6 lg:max-w-lg info-text text-gray-300'>
          Explore a wide range of hackathons happening around the world. Whether you're looking to participate, mentor, or just spectate, find the perfect event that suits your interests and skills.
        </p>
        <p className='mt-6 lg:max-w-lg info-text text-gray-300'>
          Stay updated with the latest hackathon news, schedules, and results. Connect with fellow enthusiasts and be a part of the vibrant hackathon community.
        </p>
        <div className='mt-11'>
          <Link to={'/events'}>
            <button className="button">
              <svg className="svgIcon" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"></path></svg>
              EXPLORE
            </button>
          </Link>
        </div>
      </div>

      <div className='flex-1 flex justify-center items-center'>
        <img
          src={ai}
          alt='hackathon event'
          width={570}
          height={522}
          className='object-contain hover:scale-105 transition-all duration-500 filter drop-shadow-xl'
        />
      </div>
    </section>
  );
};

export default Features;
