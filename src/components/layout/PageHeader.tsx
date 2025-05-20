import React from 'react';
import { ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-3">
          <ol className="flex items-center space-x-1 text-sm text-gray-500">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </li>
                )}
                <li>
                  {item.path ? (
                    <a
                      href={item.path}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        
        {actions && <div className="flex space-x-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;