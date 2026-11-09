import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A section the navigation knows about before the screen behind it exists.
 *
 * It says plainly what will live here and where to go meanwhile, rather than showing an
 * empty page that looks like something went wrong.
 */
function ComingSoon({ title, children, insteadLabel, insteadPath }) {
  return (
    <section className="surface p-8 text-center" aria-label={title}>
      <h2 className="font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">{children}</p>
      {insteadPath && (
        <Link to={insteadPath} className="btn btn-secondary mt-5">{insteadLabel}</Link>
      )}
    </section>
  );
}

export default ComingSoon;
