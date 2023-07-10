import { PaintBucket, PhoneCall, UserGear } from "phosphor-react";

import { Button2, IconButton2, IconOutlineButton } from "../ui/Shared";
import { PageTitle, SectionTitle } from "../ui/Typography";

export default function DesignSystem() {
  return (
    <div className="grid gap-12 p-5 max-w-3xl mx-auto content-start">
      <section className="grid gap-6">
        <PageTitle>Typography</PageTitle>
        <div className="grid gap-2">
          <PageTitle>Page Title</PageTitle>
          <SectionTitle>Section Title</SectionTitle>
          <p className="text-sm leading-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam
            aliquam alias fugit iste a, est natus voluptate blanditiis animi
            inventore consectetur ullam? Eaque culpa, assumenda dignissimos
            illum nihil veritatis delectus.
          </p>
        </div>
      </section>
      <section className="grid gap-6">
        <PageTitle>Buttons</PageTitle>
        <div className="grid gap-2 justify-start justify-items-start">
          <div className="flex gap-2 items-center flex-wrap">
            <Button2>New Button</Button2>
            <Button2 disabled>Disabled Button</Button2>
            <Button2 isLoading>Loading Button</Button2>
            <Button2 leftIcon={<PhoneCall size={16} />}>Left Icon</Button2>
            <Button2 rightIcon={<UserGear size={16} />} color="inverted">
              Right Icon
            </Button2>
            <Button2 color="blue" rightIcon={<PaintBucket size={16} />}>
              Right Icon
            </Button2>
            <Button2 color="orange" rightIcon={<PaintBucket size={16} />}>
              Right Icon
            </Button2>
            <Button2 color="purple" leftIcon={<PaintBucket size={16} />}>
              Tall Glass of Water
            </Button2>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <IconButton2>
              <PhoneCall size={16} />
            </IconButton2>
            <IconButton2 disabled>
              <PhoneCall size={16} />
            </IconButton2>
            <IconButton2 isLoading color="zinc">
              <PhoneCall size={16} />
            </IconButton2>
            <Button2 color="zinc" leftIcon={<PaintBucket size={16} />}>
              Comparing
            </Button2>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button2 size="xs">XS Button</Button2>
            <Button2>XS Button</Button2>
            <Button2 size="md">MD Button</Button2>
            <Button2 size="lg">LG Button</Button2>
          </div>
          <p>Toggle Button</p>
        </div>
      </section>
      <section className="grid gap-6">
        <PageTitle>Icon Outline Buttons</PageTitle>
        <div className="grid gap-2 justify-start justify-items-start">
          <div className="flex content-start gap-2 items-center">
            <Button2 color="blue" leftIcon={<PaintBucket size={16} />}>
              Size Test
            </Button2>
            <IconOutlineButton>
              <PhoneCall size={16} />
            </IconOutlineButton>
          </div>
        </div>
      </section>
    </div>
  );
}
