export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h3 className="font-playfair text-3xl font-bold text-foreground mb-4">
          Lucy's Beauty Parlour
        </h3>
        <p className="font-inter text-muted-foreground mb-6">
          Where elegance meets expertise
        </p>
        <p className="font-inter text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lucy's Beauty Parlour. All rights reserved.
        </p>
      </div>
    </footer>
  );
};