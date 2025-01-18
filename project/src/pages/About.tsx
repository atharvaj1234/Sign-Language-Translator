import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Globe, Users, Shield } from 'lucide-react';

const ValueCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="text-blue-600 mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our Mission to Break Down Barriers
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              We're dedicated to making communication accessible to everyone through innovative technology and community collaboration.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 rounded-full bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors duration-300"
            >
              Join Our Mission
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do in our mission to make communication accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard
              icon={<Heart className="h-8 w-8" />}
              title="Empathy"
              description="We put ourselves in our users' shoes to understand their needs and challenges."
            />
            <ValueCard
              icon={<Globe className="h-8 w-8" />}
              title="Accessibility"
              description="Making our platform accessible to everyone, regardless of their background."
            />
            <ValueCard
              icon={<Users className="h-8 w-8" />}
              title="Community"
              description="Building a supportive community that helps and learns from each other."
            />
            <ValueCard
              icon={<Shield className="h-8 w-8" />}
              title="Privacy"
              description="Protecting our users' data and privacy is our top priority."
            />
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  Founded with a vision to bridge communication gaps, our platform leverages cutting-edge AI technology to make sign language translation accessible to everyone.
                </p>
                <p>
                  What started as a small project has grown into a global platform, helping thousands of people communicate effectively across language barriers.
                </p>
                <p>
                  Today, we continue to innovate and improve our technology, working closely with the deaf community to ensure our platform meets their needs and expectations.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80"
                  alt="Team collaboration"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
            <div className="relative px-6 py-16 sm:px-12 sm:py-20">
              <div className="relative max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Be Part of Our Journey
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Join us in making communication accessible to everyone, everywhere.
                </p>
                <Link
                  to="/register"
                  className="mt-8 inline-flex items-center px-8 py-3 rounded-full bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors duration-300"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}