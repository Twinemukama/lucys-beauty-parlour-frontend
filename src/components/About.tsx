export const About = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foreground mb-8">
          Our Story
        </h2>
        <div className="space-y-6 font-inter text-lg text-muted-foreground leading-relaxed">
          <p>
            Founded with a passion for beauty and wellness, Lucy's Beauty Parlour has been
            serving our community with dedication and expertise for over a decade.
          </p>
          <p>
            Our team of highly trained professionals combines artistry with the latest
            techniques to deliver exceptional results. We believe that true beauty comes
            from feeling confident and cared for.
          </p>
          <p className="text-foreground font-medium text-xl mt-8">
            Experience the difference of personalized attention and luxury service.
          </p>
        </div>
      </div>
    </section>
  );
};