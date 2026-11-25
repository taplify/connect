import useProfileStore from '@/stores/profile';
import useUserStore from '@/stores/user';
import { ArrowTopRightOnSquareIcon, UserIcon } from '@heroicons/react/24/solid';

import PhoneFrame from './PhoneFrame';

const ProfilePreview = () => {
  const { avatarFile, name, bio, email, phoneNumber } = useUserStore();
  const { links, socialLinks } = useProfileStore();
  const visibleLinks = links.filter((link) => !link.isHidden);

  return (
    <PhoneFrame>
      <div>
        <header>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-900" />
            {avatarFile ? (
              <img
                className="aspect-square object-cover"
                src={URL.createObjectURL(avatarFile)}
                alt="Personal Profile Image"
              />
            ) : (
              <div className="pt-2">
                <UserIcon className="h-full w-full object-cover text-white" />
              </div>
            )}
          </div>

          {(name || bio || socialLinks.length > 0 || email || phoneNumber) && (
            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="flex flex-col items-center justify-center gap-2">
                {name && (
                  <h1 className="text-2xl font-medium tracking-tight text-primary-50">
                    {name}
                  </h1>
                )}

                {bio && <p className="text-sm text-primary-400">{bio}</p>}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex items-center justify-center gap-8">
                  {socialLinks.map(({ id, baseUrl, href, Logo }) => (
                    <div key={id}>
                      <a
                        href={baseUrl ? `${baseUrl}${href}` : href}
                        target="_blank"
                      >
                        <Logo className="h-4 w-4 text-primary-50" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {(email || phoneNumber) && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <button className="flex-1 rounded-lg border border-primary-50 bg-transparent p-2 text-xs text-primary-50 transition-all duration-200 hover:border-white hover:text-white">
                    Save Contact
                  </button>
                  <button className="flex-1 rounded-lg border border-primary-50 bg-primary-50 p-2 text-xs font-semibold text-primary-900 transition-all duration-200 hover:bg-white hover:text-black">
                    Connect
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <main className="flex flex-col gap-8 p-4">
          {visibleLinks.length > 0 && (
            <section id="links">
              <div className="flex flex-col gap-4">
                <h2 className="text-start text-base font-medium text-primary-50">
                  Links
                </h2>

                <ul className="flex flex-col gap-2">
                  {visibleLinks.map(({ id, name, href }) => (
                    <li key={id}>
                      <a
                        href={href}
                        target="_blank"
                        className="flex items-center justify-between rounded-lg bg-primary-50 p-4 transition-all duration-200 hover:bg-white"
                      >
                        <div>
                          <p className="text-xs font-semibold text-primary-900">
                            {name}
                          </p>
                          <p className="text-[10px] text-primary-500">{href}</p>
                        </div>

                        <ArrowTopRightOnSquareIcon className="h-5 w-5 text-primary-700" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </main>

        <footer className="px-4 pb-2 pt-6 text-[10px] text-primary-400">
          <div className="flex flex-col items-center justify-center gap-2 border-t border-primary-400 py-4">
            <p>© 2024 Taplify</p>

            <ul className="flex">
              <li>
                <a href="#">Terms</a>
                <span className="px-2">·</span>
              </li>
              <li>
                <a href="#">Sitemap</a>
                <span className="px-2">·</span>
              </li>
              <li>
                <a href="#">Privacy</a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </PhoneFrame>
  );
};

export default ProfilePreview;
